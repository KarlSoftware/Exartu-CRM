//Template.progressBar.created = function () {
//  console.log(this.data);
//};

Template.progressBar.helpers({
  progress: function () {
    return progress.get(this.name);
  },
  isDefined: function () {
    return progress.get(this.name) !== undefined ;
  }
});