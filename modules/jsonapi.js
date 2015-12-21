exports.makeJsonApiCompatible = function (data, id, type) {
  return {
    data: {
      id: id,
      type: type,
      attributes: data
    }
  }
}