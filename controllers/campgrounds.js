const Campground = require("../models/camground")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require("../cloudinary")

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    // console.log(process.env.AccessTokenExpires)
    res.send(campgrounds)
}

module.exports.createCampground = async (req, res) => {
    // console.log("files", req.files)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    // console.log(campground)
    await campground.save();
    res.status(201).send("campground is created")
}

module.exports.showCampground = async (req, res,) => {
    // const campground = await Campground.findById(req.params.id).populate('reviews');
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
    res.send(campground);
}

module.exports.EditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.send(campground.toJSON());
    // console.log(campground.image[0].url.thumbnail, "here")
    // res.send({ thumbnail: campground.thumbnail })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // console.log("imgs", imgs)
    campground.image.push(...imgs);
    await campground.save();
    // console.log(campground)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
    }
    res.status(200).send(campground._id)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.send("campground deleted")
}