// noinspection JSUnusedGlobalSymbols

class Report {
  async renderReport(inputData) {
    this.render(`Report: ${this.firstWordLetterToUpper(inputData.name.toLowerCase())} \n`);
    this.render(`Product: ${this.firstWordLetterToUpper(inputData.product.toLowerCase())} \n`);
    this.render(`Start date: ${inputData.startDate.getFullYear()}-${inputData.startDate.getMonth()}-${inputData.startDate.getDate()} \n`);
    this.render(`End date: ${inputData.endDate.getFullYear()}-${inputData.endDate.getMonth()}-${inputData.endDate.getDate()} \n`);
    this.render(`Total: ${inputData.total} \n`);
    this.render(`Average x day: ${Math.floor(inputData.total / 365)} \n`);
    this.render(`Average x week: ${Math.floor(inputData.total / 52)} \n`);
    this.render(`Average x month: ${Math.floor(inputData.total / 12)} \n`);
  }

  async exportToFile(inputData) {
    await this.createFileStream();

    this.saveToFileStream(`Report: ${this.firstWordLetterToUpper(inputData.name.toLowerCase())} \n`);
    this.saveToFileStream(`Product: ${this.firstWordLetterToUpper(inputData.product.toLowerCase())} \n`);
    this.saveToFileStream(`Start date: ${inputData.startDate.getFullYear()}-${inputData.startDate.getMonth()}-${inputData.startDate.getDate()} \n`);
    this.saveToFileStream(`End date: ${inputData.endDate.getFullYear()}-${inputData.endDate.getMonth()}-${inputData.endDate.getDate()} \n`);
    this.saveToFileStream(`Total: ${inputData.total} \n`);
    this.saveToFileStream(`Average x day: ${Math.floor(inputData.total / 365)} \n`);
    this.saveToFileStream(`Average x week: ${Math.floor(inputData.total / 52)} \n`);
    this.saveToFileStream(`Average x month: ${Math.floor(inputData.total / 12)} \n`);

    await this.closeFileStream();
  }

  //the uninteresting section..
  firstWordLetterToUpper() {}

  render() {}

  saveToFileStream(text, fileStream) {}

  async createFileStream() {}

  async closeFileStream() {}
}
