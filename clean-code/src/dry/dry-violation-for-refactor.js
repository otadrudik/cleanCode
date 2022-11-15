// noinspection JSUnusedGlobalSymbols

class Fibonnacci {
  calculateFibonnacci10() {
    let number = 10;

    this.calculate(number);
  }

  calculate(number) {
    // program to generate fibonacci series up to a certain number

    // take input from the user
    let n1 = 0,
      n2 = 1,
      nextTerm;
    console.log("Fibonacci Series:");
    console.log(n1); // print 0
    console.log(n2); // print 1

    nextTerm = n1 + n2;
    let result = "";
    while (nextTerm <= number) {
      // print the next term
      result += nextTerm + " ";

      n1 = n2;
      n2 = nextTerm;
      nextTerm = n1 + n2;
    }

    console.log(result);
  }

  calculateFibonnacci20() {
    // program to generate fibonacci series up to a certain number

    // take input from the user
    let n1 = 0,
      n2 = 1,
      nextTerm;
    console.log("Fibonacci Series:");
    console.log(n1); // print 0
    console.log(n2); // print 1

    nextTerm = n1 + n2;
    let result = "";
    while (nextTerm <= 20) {
      // print the next term
      result += nextTerm + " ";

      n1 = n2;
      n2 = nextTerm;
      nextTerm = n1 + n2;
    }

    console.log(result);
  }
}

new Fibonnacci().calculateFibonnacci();
