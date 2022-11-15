function deleteTimer(timer) {
  if (timer.hasExpired() && !timer.isRecurrent()) {
    deleteTimerFromDb(timer);
  }
}

function deleteTimerFromDb(timer) {
  // some logic
}
