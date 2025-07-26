//helper functions
const relatedPostsFunc = arr => {
    let relatedPosts = new Array();
    for (let i = 0; i < 5; i++) {
        // Declared `i` variable
        let randomIndex = Math.floor(Math.random() * arr.length);

        if (!relatedPosts.includes(arr[randomIndex])) {
            relatedPosts.push(arr[randomIndex]);
        }
    }
    //console.log(relatedPosts) // Removed unnecessary log
    return relatedPosts;
};

const readTime = content => {
    const words = content.split(" ").length;
    return Math.ceil(words / 200) + " min read";

};

function getLastItem(arr) {
    let length = arr.length;

    return arr[length - 1];
}

module.exports = { relatedPostsFunc, readTime, getLastItem };
