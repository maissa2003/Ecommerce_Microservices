import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as L from 'leaflet';
import { Bloc } from '../../models/blocs.model';
import { BlocService } from '../../services/blocs.service';
import { SalleService } from '../../services/salle.service';
import { Salle } from '../../models/salle.model';

@Component({
  selector: 'app-blocs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './blocs.component.html',
  styleUrls: ['./blocs.component.css']
})
export class BlocsComponent implements OnInit, AfterViewInit {
  blocs: Bloc[] = [];
  loading = false;
  error: string | null = null;

  // Main map
  map!: L.Map;
  markers: L.Marker[] = [];

  // Modal map properties
  modalMap?: L.Map;
  modalMarker?: L.Marker;

  // Modal properties
  showModal = false;
  modalTitle = '';
  currentBloc: Bloc = this.initializeBloc();
  isEditMode = false;

  // Delete modal
  showDeleteModal = false;
  blocToDelete: Bloc | null = null;

  // View location modal
  showLocationModal = false;
  locationViewBloc: Bloc | null = null;
  locationViewMap?: L.Map;

  // Salle modal properties
  showSalleModal = false;
  salleModalTitle = '';
  currentSalle: Salle = this.initializeSalle();
  isEditSalleMode = false;
  selectedBlocForSalle: Bloc | null = null;
  salleToDelete: Salle | null = null;
  showDeleteSalleModal = false;

  constructor(
    private blocService: BlocService,
    private salleService: SalleService
  ) {}

  ngOnInit(): void {
    this.loadBlocs();
  }

  ngAfterViewInit(): void {
    // Map will be initialized after data loads
  }

  private configureLeafletIcons() {
    const ICON_RETINA_URL =
      'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
    const ICON_URL =
      'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
    const SHADOW_URL =
      'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: ICON_RETINA_URL,
      iconUrl: ICON_URL,
      shadowUrl: SHADOW_URL
    });
  }

  initializeBloc(): Bloc {
    return {
      id: 0,
      nom: '',
      location: '',
      salles: []
    };
  }

  initializeSalle(): Salle {
    return {
      name: '',
      capacity: 0,
      status: 'available',
      bloc: undefined
    };
  }

  loadBlocs(): void {
    this.loading = true;
    this.blocService.getAll().subscribe({
      next: data => {
        this.blocs = data || [];
        this.error = null;
        this.loading = false;
        this.populateSalles();
      },
      error: err => {
        console.error('Error loading blocs:', err);
        if (err && err.status) {
          this.error = `Error ${err.status} ${err.statusText ||
            ''} - ${err.message || 'Server error'}`;
        } else {
          this.error = err?.message || 'Failed to load blocs';
        }
        this.loading = false;
      }
    });
  }

  private initMap(): void {
    this.configureLeafletIcons();

    if (this.map) {
      try {
        this.map.remove();
      } catch (e) {}
    }

    const mapElement = document.getElementById('blocsMap');
    if (!mapElement) return;

    this.map = L.map('blocsMap').setView([36.8065, 10.1815], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addMarkers();

    setTimeout(() => {
      try {
        this.map.invalidateSize({ animate: false, pan: false });
      } catch (e) {}
    }, 100);
  }

  // ─── FIXED: initModalMap ────────────────────────────────────────────────────
  private initModalMap(centerOnLocation: boolean = false): void {
    this.configureLeafletIcons();

    // Destroy existing modal map
    if (this.modalMap) {
      try {
        this.modalMap.remove();
      } catch (e) {}
      this.modalMap = undefined;
      this.modalMarker = undefined;
    }

    const modalMapElement = document.getElementById('modalMap');
    if (!modalMapElement) return;

    // Force the element to have explicit pixel dimensions before Leaflet reads them
    modalMapElement.style.height = '320px';
    modalMapElement.style.width = '100%';
    modalMapElement.style.display = 'block';

    let lat = 36.8065;
    let lng = 10.1815;
    let zoom = 13;

    this.modalMap = L.map('modalMap', {
      // Disable animations to avoid dimension race conditions
      fadeAnimation: false,
      zoomAnimation: false
    }).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.modalMap);

    // Force correct dimensions immediately and again after a short delay
    this.forceMapResize(this.modalMap);

    // If editing, try to center on existing location
    if (centerOnLocation && this.currentBloc.location) {
      const coords = this.parseCoords(this.currentBloc.location);
      if (coords) {
        this.placeModalMarker(coords[0], coords[1]);
        this.modalMap.setView([coords[0], coords[1]], 15);
        this.forceMapResize(this.modalMap);
      } else {
        this.forwardGeocode(this.currentBloc.location)
          .then(res => {
            if (res && this.modalMap) {
              this.placeModalMarker(res.lat, res.lon);
              this.modalMap.setView([res.lat, res.lon], 15);
              this.forceMapResize(this.modalMap);
            }
          })
          .catch(() => {});
      }
    }

    // Click to set location
    this.modalMap.on('click', (e: L.LeafletMouseEvent) => {
      const clickLat = e.latlng.lat;
      const clickLng = e.latlng.lng;

      this.placeModalMarker(clickLat, clickLng);

      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}`
      )
        .then(r => r.json())
        .then(data => {
          if (data && data.display_name) {
            this.currentBloc.location = data.display_name;
          } else {
            this.currentBloc.location = `${clickLat.toFixed(
              6
            )}, ${clickLng.toFixed(6)}`;
          }
        })
        .catch(() => {
          this.currentBloc.location = `${clickLat.toFixed(
            6
          )}, ${clickLng.toFixed(6)}`;
        });
    });
  }

  // ─── HELPER: force Leaflet to recalculate map size ──────────────────────────
  private forceMapResize(map: L.Map): void {
    // Call immediately
    try {
      map.invalidateSize({ animate: false, pan: false });
    } catch (e) {}

    // Call again after browser paint
    requestAnimationFrame(() => {
      try {
        map.invalidateSize({ animate: false, pan: false });
      } catch (e) {}
    });

    // Final call after any lingering CSS transitions
    setTimeout(() => {
      try {
        map.invalidateSize({ animate: false, pan: false });
      } catch (e) {}
    }, 300);
  }

  private placeModalMarker(lat: number, lng: number) {
    if (!this.modalMap) return;

    if (this.modalMarker) {
      try {
        this.modalMap.removeLayer(this.modalMarker);
      } catch (e) {}
    }

    const icon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.modalMarker = L.marker([lat, lng], { icon }).addTo(this.modalMap);
    this.modalMarker.bindPopup(`<b>Selected Location</b>`).openPopup();
  }

  private parseCoords(loc: string | undefined): [number, number] | null {
    if (!loc) return null;

    const parts = loc.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      const a = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);
      if (!isNaN(a) && !isNaN(b)) return [a, b];
    }
    return null;
  }

  private async forwardGeocode(
    address: string
  ): Promise<{ lat: number; lon: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    }
    return null;
  }

  private async addMarkers(): Promise<void> {
    // Clear existing markers
    this.markers.forEach(marker => {
      try {
        this.map.removeLayer(marker);
      } catch (e) {}
    });
    this.markers = [];

    if (!this.blocs || this.blocs.length === 0) return;

    for (const bloc of this.blocs) {
      if (!bloc.location) continue;

      let lat: number | null = null;
      let lng: number | null = null;

      // First try direct coordinates
      const coords = this.parseCoords(bloc.location);
      if (coords) {
        lat = coords[0];
        lng = coords[1];
      } else {
        // Geocode the address
        const result = await this.geocodeAddress(bloc.location);
        if (result) {
          lat = result.lat;
          lng = result.lon;
        }
      }

      if (lat !== null && lng !== null) {
        const redIcon = L.icon({
          iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl:
            'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = L.marker([lat, lng], { icon: redIcon }).addTo(this.map);
        marker.bindPopup(`
  <div style="text-align:center; min-width:140px;">
    <div style="font-size:15px; font-weight:700; color:#b91c1c; margin-bottom:4px;">🏢 ${
      bloc.nom
    }</div>
    <div style="font-size:12px; color:#64748b; margin-bottom:4px;">${
      bloc.location
    }</div>
    <div style="font-size:12px; color:#b91c1c; font-weight:600;">🚪 ${bloc
      .salles?.length || 0} salle(s)</div>
  </div>
`);
        this.markers.push(marker);
      }
    }

    // Fit bounds if there are markers
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.3));
    }
  }

  // ─── FIXED: openAddModal ────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode = false;
    this.modalTitle = 'Add New Bloc';
    this.currentBloc = this.initializeBloc();
    this.showModal = true;

    // Wait for modal DOM + CSS transition to fully complete
    setTimeout(() => this.initModalMap(false), 400);
  }

  // ─── FIXED: openEditModal ───────────────────────────────────────────────────
  openEditModal(bloc: Bloc): void {
    this.isEditMode = true;
    this.modalTitle = 'Edit Bloc';
    this.currentBloc = { ...bloc };
    this.showModal = true;

    setTimeout(() => this.initModalMap(true), 400);
  }

  openDeleteModal(bloc: Bloc): void {
    this.blocToDelete = bloc;
    this.showDeleteModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentBloc = this.initializeBloc();

    if (this.modalMap) {
      try {
        this.modalMap.remove();
      } catch (e) {}
      this.modalMap = undefined;
      this.modalMarker = undefined;
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.blocToDelete = null;
  }

  openLocationModal(bloc: Bloc): void {
    this.locationViewBloc = bloc;
    this.showLocationModal = true;
    setTimeout(() => this.initLocationViewMap(), 400);
  }

  closeLocationModal(): void {
    this.showLocationModal = false;
    this.locationViewBloc = null;
    if (this.locationViewMap) {
      try {
        this.locationViewMap.remove();
      } catch (e) {}
      this.locationViewMap = undefined;
    }
  }

  // ─── FIXED: initLocationViewMap ─────────────────────────────────────────────
  private initLocationViewMap(): void {
    if (!this.locationViewBloc) return;

    this.configureLeafletIcons();

    if (this.locationViewMap) {
      try {
        this.locationViewMap.remove();
      } catch (e) {}
      this.locationViewMap = undefined;
    }

    const mapElement = document.getElementById('locationViewMap');
    if (!mapElement) {
      console.error('Location view map element not found');
      return;
    }

    // Force explicit pixel dimensions
    mapElement.style.height = '380px';
    mapElement.style.width = '100%';
    mapElement.style.display = 'block';

    const defaultLat = 36.8065;
    const defaultLng = 10.1815;

    if (this.locationViewBloc.location) {
      const coords = this.parseCoords(this.locationViewBloc.location);
      if (coords) {
        this.initializeMapWithLocation(coords[0], coords[1], 15, true);
      } else {
        this.geocodeAddress(this.locationViewBloc.location)
          .then(result => {
            if (result) {
              this.initializeMapWithLocation(result.lat, result.lon, 15, true);
            } else {
              this.initializeMapWithLocation(defaultLat, defaultLng, 13, false);
            }
          })
          .catch(() => {
            this.initializeMapWithLocation(defaultLat, defaultLng, 13, false);
          });
      }
    } else {
      this.initializeMapWithLocation(defaultLat, defaultLng, 13, false);
    }
  }

  private async geocodeAddress(
    address: string
  ): Promise<{ lat: number; lon: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    }
    return null;
  }

  private initializeMapWithLocation(
    lat: number,
    lng: number,
    zoom: number,
    hasValidLocation: boolean
  ): void {
    this.locationViewMap = L.map('locationViewMap', {
      fadeAnimation: false,
      zoomAnimation: false
    }).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.locationViewMap);

    if (hasValidLocation && this.locationViewBloc) {
      const redIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const marker = L.marker([lat, lng], { icon: redIcon }).addTo(
        this.locationViewMap
      );
      marker
        .bindPopup(
          `
        <b>${this.locationViewBloc.nom}</b><br/>
        ${this.locationViewBloc.location}
      `
        )
        .openPopup();
    } else {
      const message = this.locationViewBloc?.location
        ? `Could not find coordinates for: "${this.locationViewBloc.location}"`
        : 'No location set for this bloc';

      L.popup()
        .setLatLng([lat, lng])
        .setContent(
          `
          <b>${this.locationViewBloc?.nom || 'Bloc'}</b><br/>
          ${message}<br/>
          <small>Click on the map in edit mode to set a precise location</small>
        `
        )
        .openOn(this.locationViewMap);
    }

    // Force resize with multiple passes
    this.forceMapResize(this.locationViewMap);
  }

  saveBloc(): void {
    if (this.isEditMode && this.currentBloc.id) {
      this.blocService.update(this.currentBloc.id, this.currentBloc).subscribe({
        next: updatedBloc => {
          const index = this.blocs.findIndex(b => b.id === updatedBloc.id);
          if (index !== -1) {
            this.blocs[index] = updatedBloc;
          }
          this.closeModal();
          this.error = null;
          this.refreshMap();
        },
        error: err => {
          console.error('Error updating bloc:', err);
          this.error = err?.message || 'Failed to update bloc';
        }
      });
    } else {
      this.blocService.add(this.currentBloc).subscribe({
        next: newBloc => {
          this.blocs.push(newBloc);
          this.closeModal();
          this.error = null;
          this.refreshMap();
        },
        error: err => {
          console.error('Error adding bloc:', err);
          this.error = err?.message || 'Failed to add bloc';
        }
      });
    }
  }

  deleteBloc(): void {
    if (this.blocToDelete && this.blocToDelete.id) {
      this.blocService.delete(this.blocToDelete.id).subscribe({
        next: () => {
          this.blocs = this.blocs.filter(b => b.id !== this.blocToDelete?.id);
          this.closeDeleteModal();
          this.error = null;
          this.refreshMap();
        },
        error: err => {
          console.error('Error deleting bloc:', err);
          this.error = err?.message || 'Failed to delete bloc';
          this.closeDeleteModal();
        }
      });
    }
  }

  refreshMap(): void {
    if (this.map) {
      this.markers.forEach(marker => {
        try {
          this.map.removeLayer(marker);
        } catch (e) {}
      });
      this.markers = [];
      this.addMarkers(); // async, no need to await
    }
  }

  private populateSalles(): void {
    this.salleService.getAll().subscribe({
      next: (salles: Salle[]) => {
        this.blocs = this.blocs.map(bloc => ({
          ...bloc,
          salles: salles.filter(salle => {
            const salleBlocId =
              (salle as any).bloc?.id ?? (salle as any).blocId;
            return String(salleBlocId) === String(bloc.id);
          })
        }));

        console.log(
          'Salles attached to blocs:',
          this.blocs.map(b => ({
            blocId: b.id,
            sallesCount: b.salles?.length || 0
          }))
        );

        setTimeout(() => this.initMap(), 200);
      },
      error: err => {
        console.error('Error loading salles:', err);
        setTimeout(() => this.initMap(), 200);
      }
    });
  }

  retry(): void {
    this.error = null;
    this.loadBlocs();
  }

  getSallesCount(bloc: Bloc): number {
    return bloc.salles?.length || 0;
  }

  hasSalles(bloc: Bloc): boolean {
    return !!(bloc.salles && bloc.salles.length > 0);
  }

  // ───────────────────────────────────────────────────────────────── SALLE MODALS

  openAddSalleModal(bloc: Bloc): void {
    this.isEditSalleMode = false;
    this.salleModalTitle = `Add Salle to ${bloc.nom}`;
    this.currentSalle = this.initializeSalle();
    this.selectedBlocForSalle = bloc;
    this.currentSalle.bloc = bloc;
    this.showSalleModal = true;
  }

  openEditSalleModal(salle: Salle, bloc: Bloc): void {
    this.isEditSalleMode = true;
    this.salleModalTitle = `Edit Salle in ${bloc.nom}`;
    this.currentSalle = { ...salle };
    this.selectedBlocForSalle = bloc;
    this.showSalleModal = true;
  }

  openDeleteSalleModal(salle: Salle): void {
    this.salleToDelete = salle;
    this.showDeleteSalleModal = true;
  }

  closeSalleModal(): void {
    this.showSalleModal = false;
    this.currentSalle = this.initializeSalle();
    this.selectedBlocForSalle = null;
  }

  closeDeleteSalleModal(): void {
    this.showDeleteSalleModal = false;
    this.salleToDelete = null;
  }

  saveSalle(): void {
    if (
      !this.currentSalle.name ||
      !this.currentSalle.capacity ||
      !this.selectedBlocForSalle
    ) {
      this.error = 'Please fill all required fields';
      return;
    }

    if (this.isEditSalleMode && this.currentSalle.id) {
      this.salleService
        .update(this.currentSalle.id, this.currentSalle)
        .subscribe({
          next: updatedSalle => {
            const bloc = this.blocs.find(
              b => b.id === this.selectedBlocForSalle?.id
            );
            if (bloc && bloc.salles) {
              const index = bloc.salles.findIndex(
                s => s.id === updatedSalle.id
              );
              if (index !== -1) {
                bloc.salles[index] = updatedSalle;
              }
            }
            this.closeSalleModal();
            this.error = null;
          },
          error: err => {
            console.error('Error updating salle:', err);
            this.error = err?.message || 'Failed to update salle';
          }
        });
    } else {
      this.salleService.add(this.currentSalle).subscribe({
        next: newSalle => {
          const bloc = this.blocs.find(
            b => b.id === this.selectedBlocForSalle?.id
          );
          if (bloc) {
            if (!bloc.salles) bloc.salles = [];
            bloc.salles.push(newSalle);
          }
          this.closeSalleModal();
          this.error = null;
        },
        error: err => {
          console.error('Error adding salle:', err);
          this.error = err?.message || 'Failed to add salle';
        }
      });
    }
  }

  deleteSalle(): void {
    if (this.salleToDelete && this.salleToDelete.id) {
      this.salleService.delete(this.salleToDelete.id).subscribe({
        next: () => {
          this.blocs.forEach(bloc => {
            if (bloc.salles) {
              bloc.salles = bloc.salles.filter(
                s => s.id !== this.salleToDelete?.id
              );
            }
          });
          this.closeDeleteSalleModal();
          this.error = null;
        },
        error: err => {
          console.error('Error deleting salle:', err);
          this.error = err?.message || 'Failed to delete salle';
          this.closeDeleteSalleModal();
        }
      });
    }
  }
}
