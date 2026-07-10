import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';

interface CategoryData {
  name: string;
  value: number;
  color: string;
  key: string;
}

interface PieTooltipElements {
  container: HTMLElement;
  name: HTMLElement;
  value: HTMLElement;
}

export class PieChart {
  private svg!: SVGElement;
  private segmentsGroup!: SVGGElement;
  private tooltip!: PieTooltipElements;
  private data!: CategoryData[];
  private outerRadius: number = 80;
  private innerRadius: number = 0;
  private padding: number = 3;

  constructor() {}

  init(): void {
    this.svg = document.querySelector('.chart-pie__svg') as SVGElement;
    this.segmentsGroup = document.querySelector('.chart-pie__segments') as SVGGElement;
    this.tooltip = {
      container: document.getElementById('pieTooltip') as HTMLElement,
      name: document.querySelector('.chart-pie__tooltip-name') as HTMLElement,
      value: document.querySelector('.chart-pie__tooltip-value') as HTMLElement,
    };

    this.data = [
      { name: 'Riesgo', value: 45, color: '#00d7ce', key: 'riesgo' },
      { name: 'Moderada', value: 62, color: '#00c0e6', key: 'moderada' },
      { name: 'Severa', value: 28, color: '#5981DF', key: 'severa' },
      { name: 'Crónica', value: 21, color: '#0A1128', key: 'cronica' },
    ];

    this.renderSegments();
    this.bindLegendEvents();
  }

  private polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ): { x: number; y: number } {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  private describeArc(
    x: number,
    y: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ): string {
    if (innerRadius === 0) {
      // Pie chart path
      const start = this.polarToCartesian(x, y, outerRadius, endAngle);
      const end = this.polarToCartesian(x, y, outerRadius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

      return [
        'M', x, y,
        'L', start.x, start.y,
        'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        'L', x, y,
        'Z',
      ].join(' ');
    } else {
      // Donut chart path
      const start = this.polarToCartesian(x, y, outerRadius, endAngle);
      const end = this.polarToCartesian(x, y, outerRadius, startAngle);
      const innerStart = this.polarToCartesian(x, y, innerRadius, endAngle);
      const innerEnd = this.polarToCartesian(x, y, innerRadius, startAngle);

      const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

      return [
        'M', start.x, start.y,
        'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        'L', innerEnd.x, innerEnd.y,
        'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        'Z',
      ].join(' ');
    }
  }

  private renderSegments(): void {
    const total = this.data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    this.segmentsGroup.innerHTML = '';

    this.data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 360;
      const startAngle = currentAngle + this.padding / 2;
      const endAngle = currentAngle + sliceAngle - this.padding / 2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        this.describeArc(0, 0, this.outerRadius, this.innerRadius, startAngle, endAngle)
      );
      path.setAttribute('fill', item.color);
      path.setAttribute('data-name', item.name);
      path.setAttribute('data-value', item.value.toString());
      path.setAttribute('data-key', item.key);
      path.style.opacity = '1';

      path.addEventListener('mouseenter', (e) => this.showTooltip(e));
      path.addEventListener('mouseleave', () => this.hideTooltip());
      path.addEventListener('mousemove', (e) => this.moveTooltip(e));

      this.segmentsGroup.appendChild(path);

      currentAngle += sliceAngle;
    });
  }

  private showTooltip(e: MouseEvent): void {
    const target = e.target as SVGPathElement;
    const name = target.getAttribute('data-name') || '';
    const value = target.getAttribute('data-value') || '';
    const total = this.data.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((parseInt(value) / total) * 100).toFixed(1);

    this.tooltip.name.textContent = name;
    this.tooltip.value.textContent = `${value} casos (${percentage}%)`;
    this.tooltip.container.classList.add('chart-pie__tooltip--visible');

    this.moveTooltip(e);
  }

  private hideTooltip(): void {
    this.tooltip.container.classList.remove('chart-pie__tooltip--visible');
  }

  private moveTooltip(e: MouseEvent): void {
    const chartContainer = document.querySelector('.chart-pie') as HTMLElement;
    const rect = chartContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.tooltip.container.style.left = `${x}px`;
    this.tooltip.container.style.top = `${y}px`;
  }

  private bindLegendEvents(): void {
    const legendItems = document.querySelectorAll('.chart-pie__legend-item');

    legendItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const category = item.getAttribute('data-category');
        const segment = this.segmentsGroup.querySelector(`[data-key="${category}"]`);
        if (segment) {
          (segment as SVGPathElement).style.transform = 'scale(1.05)';
          (segment as SVGPathElement).style.filter = 'brightness(1.1)';
        }
      });

      item.addEventListener('mouseleave', () => {
        const category = item.getAttribute('data-category');
        const segment = this.segmentsGroup.querySelector(`[data-key="${category}"]`);
        if (segment) {
          (segment as SVGPathElement).style.transform = '';
          (segment as SVGPathElement).style.filter = '';
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PieChart();
});