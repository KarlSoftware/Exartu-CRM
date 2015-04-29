Contactables.after.insert(function (userId, doc) {
  if (doc.tags != null) {
    _.forEach(doc.tags, function (t) {
      if (!Tags.findOne({tags: t})) {
        Tags.insert({tags: t});
      }
    })
  }
});

Contactables.after.update(function (userId, doc, fieldNames, modifier, options) {
  // in case you delete a tag, it wouldn't be deleted from the tag collection
  if (fieldNames.indexOf('tags') != -1) {
    if (doc.tags != null) {
      _.forEach(doc.tags, function (t) {
        if (!Tags.findOne({tags: t})) {
          Tags.insert({tags: t});
        }
      })
    }
  }
});


Jobs.after.insert(function (userId, doc) {
  if (doc.tags != null) {
    _.forEach(doc.tags, function (t) {
      if (!Tags.findOne({tags: t})) {
        Tags.insert({tags: t});
      }
    })
  }
});

Jobs.after.update(function (userId, doc, fieldNames, modifier, options) {
  // in case you delete a tag, it wouldn't be deleted from the tag collection
  if (fieldNames.indexOf('tags') != -1) {
    if (doc.tags != null) {
      _.forEach(doc.tags, function (t) {
        if (!Tags.findOne({tags: t})) {
          Tags.insert({tags: t});
        }
      })
    }
  }
});


Placements.after.update(function (userId, doc, fieldNames, modifier, options) {
  // in case you delete a tag, it wouldn't be deleted from the tag collection
  if (fieldNames.indexOf('tags') != -1) {
    if (doc.tags != null) {
      _.forEach(doc.tags, function (t) {
        if (!Tags.findOne({tags: t})) {
          Tags.insert({tags: t});
        }
      })
    }
  }
});

Placements.after.insert(function (userId, doc) {
  if (doc.tags != null) {
    _.forEach(doc.tags, function (t) {
      if (!Tags.findOne({tags: t})) {
        Tags.insert({tags: t});
      }
    })
  }
});