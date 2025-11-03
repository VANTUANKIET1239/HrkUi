import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';


@Injectable({
  providedIn: 'root' // This makes it a global singleton
})
export class NavigationService {

  // Import the routes object

  constructor(
    private router: Router,
    private location: Location
  ) { }


  /**
   * Navigates to a path with optional query params.
   * @param path - The path to navigate to (e.g., from AppRoutes)
   * @param queryParams - Optional query parameters
   */
  goTo(path: string, queryParams?: NavigationExtras['queryParams']): Promise<boolean> {
    const navigationExtras: NavigationExtras = { queryParams };
    return this.router.navigate([path], navigationExtras);
  }

  // --- History Methods ---

  /**
   * Navigates back one step in the browser's history.
   */
  goBack(): void {
    this.location.back();
  }
}
