async function searchPictures(query, per_page) {
    try {
        query = query.join("+");
        let unsplashResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&per_page=${per_page}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
                }
            }
        );

        if (!unsplashResponse.ok) {
            return {
                success: false,
                message: "error while retrieving unsplashResults"
            };
        }

        let data = await unsplashResponse.json();
        console.log(data);
        return data.results;
    } catch (err) {
        console.error(err);
    }
}

module.exports = searchPictures;
