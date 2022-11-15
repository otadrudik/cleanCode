// noinspection JSUnusedGlobalSymbols

class Report {
  async renderReport(inputData) {
    const reportData = this.transformToReportData(inputData);
    this.renderReportData(reportData);
  }

  async exportToFile(inputData) {
    await this.createStream();

    const reportData = this.transformToReportData(inputData);
    this.saveReportDataToStream(reportData);

    await this.closeStream();
  }

  transformToReportData(inputData) {
    return [
      `Report: ${this.formatText(inputData.name)}`,
      `Product: ${this.formatText(inputData.product)}`,
      `Start date: ${this.formatDate(inputData.startDate)}`,
      `End date: ${this.formatDate(inputData.endDate)}`,
      `Total: ${inputData.total}`,
      `Average x day: ${this.formatAverage(inputData.total / 365)}`,
      `Average x week: ${this.formatAverage(inputData.total / 52)}`,
      `Average x month: ${this.formatAverage(inputData.total / 12)}`,
    ];
  }

  //the uninteresting section..
  formatAverage() {}

  formatDate(date) {}

  formatText(text) {}

  firstWordLetterToUpper(text) {}

  renderReportData(text) {}

  saveReportDataToStream(reportData, fileStream) {}

  async createStream() {}

  async closeStream() {}
}
