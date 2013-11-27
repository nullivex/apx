module.exports = function(mongoose) {
  var Example = mongoose.model("Example", {
    title: String,
    body: String
  });

  Example.schema.path("title").validate(function(value) {
    return value.toString().length < 10
  }, "Too long")

  return Example
}
