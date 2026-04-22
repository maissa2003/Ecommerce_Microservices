import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.createSessionsChart();
    this.createEquipmentChart();
  }

  createSessionsChart() {
    new Chart('sessionsChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sessions',
            data: [12, 19, 7, 15, 22, 30],
            borderColor: '#c22b33',
            backgroundColor: 'rgba(194,43,51,0.2)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            labels: { color: 'white' }
          }
        },
        scales: {
          x: {
            ticks: { color: 'white' }
          },
          y: {
            ticks: { color: 'white' }
          }
        }
      }
    });
  }

  createEquipmentChart() {
    new Chart('equipmentChart', {
      type: 'doughnut',
      data: {
        labels: ['Used', 'Available'],
        datasets: [
          {
            data: [65, 35],
            backgroundColor: ['#c22b33', '#ffffff']
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            labels: { color: 'white' }
          }
        }
      }
    });
  }
}
