exports.generateSlug=(post)=>{
  return post.title.toLocaleLowerCase().trim().replace(/\W+/g, "-") + "--" + post._id

}