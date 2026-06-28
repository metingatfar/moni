export interface ReportRef {
  name: string;
  category: 'sprint' | 'quality' | 'diagnostics' | 'security' | 'coverage';
  filePath: string;
}

export class ReportsWorkspace {
  private reports: ReportRef[] = [
    { name: 'Technical Debt Report', category: 'quality', filePath: 'reports/Technical_Debt_Report.md' },
    { name: 'Diagnostics Report', category: 'diagnostics', filePath: 'reports/Diagnostics_Report.md' },
    { name: 'Production Readiness Report', category: 'sprint', filePath: 'reports/Production_Readiness_Report.md' }
  ];

  public getReports(): ReportRef[] {
    return this.reports;
  }

  public registerReport(report: ReportRef): void {
    if (!this.reports.some(r => r.filePath === report.filePath)) {
      this.reports.push(report);
    }
  }

  public getByCategory(category: ReportRef['category']): ReportRef[] {
    return this.reports.filter(r => r.category === category);
  }
}
