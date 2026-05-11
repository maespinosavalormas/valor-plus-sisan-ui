import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';

interface TooltipElements {
  container: HTMLElement;
  month: HTMLElement;
  value: HTMLElement;
}

export class TrendChart {
  private svg!: SVGElement;
  private tooltip!: TooltipElements;
  private dots!: NodeListOf<SVGCircleElement>;

  constructor() {}

  init(): void {
    this.svg = document.querySelector('.chart-area__svg') as SVGElement;
    this.tooltip = {
      container: document.getElementById('trendTooltip') as HTMLElement,
      month: document.querySelector('.chart-area__tooltip-month') as HTMLElement,
      value: document.querySelector('.chart-area__tooltip-value') as HTMLElement,
    };
    this.dots = document.querySelectorAll('.chart-area__dots circle');

    this.bindEvents();
  }

  private bindEvents(): void {
    this.dots.forEach((dot) => {
      dot.addEventListener('mouseenter', (e) => this.showTooltip(e));
      dot.addEventListener('mouseleave', () => this.hideTooltip());
      dot.addEventListener('mousemove', (e) => this.moveTooltip(e));
    });
  }

  private showTooltip(e: MouseEvent): void {
    const target = e.target as SVGCircleElement;
    const month = target.getAttribute('data-month') || '';
    const value = target.getAttribute('data-value') || '';
    const isCasos = target.closest('.chart-area__dots--casos') !== null;

    this.tooltip.month.textContent = month;
    this.tooltip.value.textContent = `${isCasos ? 'Notificados' : 'Resueltos'}: ${value}`;
    this.tooltip.container.classList.add('chart-area__tooltip--visible');

    this.moveTooltip(e);
  }

  private hideTooltip(): void {
    this.tooltip.container.classList.remove('chart-area__tooltip--visible');
  }

  private moveTooltip(e: MouseEvent): void {
    const rect = this.svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - 10;

    this.tooltip.container.style.left = `${x}px`;
    this.tooltip.container.style.top = `${y}px`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TrendChart();
});

