export const trending = (req, res) => res.send("Homepage Videos");

export const see = (req, res) => {
    console.log(req.params);
    return res.send(`Watch Videos #${req.params.id}`);
}
export const edit = (req, res) => {
    return res.send("Edit")
}
export const search = (req, res) => {
    return res.send("Search")
}
export const upload = (req, res) => {
    return res.send("Upload Video")
}
export const deleteVideo = (req, res) => {
    return res.send("Delete Video")
}