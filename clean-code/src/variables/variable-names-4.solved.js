function deleteTimer(timer) {
  if (shouldBeDeleted(timer)) {
    deleteTimerFromDb(timer);
  }
}

function shouldBeDeleted(timer) {
  return timer.hasExpired() && !timer.isRecurrent();
}

function deleteTimerFromDb(timer) {
  // some logic
}
