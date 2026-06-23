import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface HeartRatePoint {
  timestamp: string;
  bpm: number;
}

export interface Workout {
  id: number;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED';
  startTime: string;
  endTime?: string;
  avgBpm?: number;
  maxBpm?: number;
  durationSeconds?: number;
  heartRateData?: HeartRatePoint[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = '/api/workouts';
  private localMode = false; // Set dynamically if backend connection fails

  constructor(private http: HttpClient) {
    // Check if we already have local workouts initialized
    if (!localStorage.getItem('calistenic_workouts')) {
      localStorage.setItem('calistenic_workouts', JSON.stringify([]));
    }
  }

  /**
   * Start a workout session
   */
  startWorkout(name: string, description: string): Observable<Workout> {
    const payload = { name, description };
    
    if (this.localMode) {
      return of(this.startLocalWorkout(name, description));
    }

    return this.http.post<Workout>(`${this.apiUrl}/start`, payload).pipe(
      catchError(err => {
        console.warn('Backend offline, entering Local Storage Mode for this session:', err);
        this.localMode = true;
        return of(this.startLocalWorkout(name, description));
      })
    );
  }

  /**
   * Save recorded heart rate data points to active session
   */
  saveHeartRates(workoutId: number, dataPoints: HeartRatePoint[]): Observable<any> {
    if (this.localMode || workoutId < 0) {
      this.saveLocalHeartRates(workoutId, dataPoints);
      return of({ status: 'success', local: true });
    }

    return this.http.post(`${this.apiUrl}/${workoutId}/heart-rate`, dataPoints).pipe(
      catchError(err => {
        console.warn('Failed to upload data points to backend, logging locally:', err);
        this.saveLocalHeartRates(workoutId, dataPoints);
        return of({ status: 'success', local: true });
      })
    );
  }

  /**
   * End a workout session
   */
  endWorkout(workoutId: number): Observable<Workout> {
    if (this.localMode || workoutId < 0) {
      return of(this.endLocalWorkout(workoutId));
    }

    return this.http.post<Workout>(`${this.apiUrl}/${workoutId}/end`, {}).pipe(
      catchError(err => {
        console.warn('Failed to end workout on backend, ending locally:', err);
        return of(this.endLocalWorkout(workoutId));
      })
    );
  }

  /**
   * Get all workouts (for history list)
   */
  getWorkouts(): Observable<Workout[]> {
    if (this.localMode) {
      return of(this.getLocalWorkouts());
    }

    return this.http.get<Workout[]>(this.apiUrl).pipe(
      catchError(err => {
        console.warn('Backend offline, retrieving workouts from Local Storage:', err);
        this.localMode = true;
        return of(this.getLocalWorkouts());
      })
    );
  }

  /**
   * Get detailed workout session (including full HR points)
   */
  getWorkoutDetails(id: number): Observable<Workout> {
    if (this.localMode || id < 0) {
      const workout = this.getLocalWorkoutById(id);
      return workout ? of(workout) : throwError(() => new Error('Workout not found locally.'));
    }

    return this.http.get<Workout>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn(`Failed to fetch workout ${id} from backend, loading locally:`, err);
        const workout = this.getLocalWorkoutById(id);
        return workout ? of(workout) : throwError(() => err);
      })
    );
  }

  /**
   * Delete a workout session
   */
  deleteWorkout(id: number): Observable<any> {
    if (this.localMode || id < 0) {
      this.deleteLocalWorkout(id);
      return of({ status: 'deleted', local: true });
    }

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn(`Failed to delete workout ${id} on backend, deleting locally:`, err);
        this.deleteLocalWorkout(id);
        return of({ status: 'deleted', local: true });
      })
    );
  }

  /**
   * Reset mode (to check backend connectivity again)
   */
  resetToBackendMode() {
    this.localMode = false;
  }

  isLocalMode(): boolean {
    return this.localMode;
  }

  // --- LOCAL STORAGE BACKEND ENGINE ---
  
  private getLocalWorkouts(): Workout[] {
    const raw = localStorage.getItem('calistenic_workouts');
    return raw ? JSON.parse(raw) : [];
  }

  private saveLocalWorkouts(workouts: Workout[]) {
    localStorage.setItem('calistenic_workouts', JSON.stringify(workouts));
  }

  private startLocalWorkout(name: string, description: string): Workout {
    const workouts = this.getLocalWorkouts();
    // Negative IDs indicate temporary local-only sessions
    const nextId = workouts.length > 0 ? Math.min(...workouts.map(w => w.id)) - 1 : -1;
    
    const newWorkout: Workout = {
      id: nextId,
      name,
      description,
      status: 'ACTIVE',
      startTime: new Date().toISOString(),
      heartRateData: []
    };

    workouts.unshift(newWorkout);
    this.saveLocalWorkouts(workouts);
    return newWorkout;
  }

  private saveLocalHeartRates(workoutId: number, dataPoints: HeartRatePoint[]) {
    const workouts = this.getLocalWorkouts();
    const workout = workouts.find(w => w.id === workoutId);
    if (workout) {
      if (!workout.heartRateData) {
        workout.heartRateData = [];
      }
      workout.heartRateData.push(...dataPoints);
      this.saveLocalWorkouts(workouts);
    }
  }

  private endLocalWorkout(workoutId: number): Workout {
    const workouts = this.getLocalWorkouts();
    const index = workouts.findIndex(w => w.id === workoutId);
    
    if (index !== -1) {
      const workout = workouts[index];
      workout.status = 'COMPLETED';
      workout.endTime = new Date().toISOString();

      // Calculate statistics
      const hrPoints = workout.heartRateData || [];
      if (hrPoints.length > 0) {
        const bpms = hrPoints.map(p => p.bpm);
        const sum = bpms.reduce((a, b) => a + b, 0);
        workout.avgBpm = Math.round(sum / bpms.length);
        workout.maxBpm = Math.max(...bpms);
      } else {
        workout.avgBpm = 0;
        workout.maxBpm = 0;
      }

      // Calculate duration
      const start = new Date(workout.startTime).getTime();
      const end = new Date(workout.endTime).getTime();
      workout.durationSeconds = Math.round((end - start) / 1000);

      workouts[index] = workout;
      this.saveLocalWorkouts(workouts);
      return workout;
    }
    
    throw new Error('Workout session not found during local closing');
  }

  private getLocalWorkoutById(id: number): Workout | undefined {
    return this.getLocalWorkouts().find(w => w.id === id);
  }

  private deleteLocalWorkout(id: number) {
    let workouts = this.getLocalWorkouts();
    workouts = workouts.filter(w => w.id !== id);
    this.saveLocalWorkouts(workouts);
  }
}
