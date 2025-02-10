const mongoose = require("mongoose");
// const { Campground } = require("../model/campground");
const Campground = require("../models/camground")
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/modified-yelpcamp");
}

main()
    .then(res => console.log("database connected"))
    .catch(err => console.log(err));

const sampleArr = array => array[Math.floor(Math.random() * array.length)]

const func = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground(
            {
                author: "6796fa4a67c8a376029f2a95",
                location: `${cities[rand1000].city},${cities[rand1000].state}`,
                title: `${sampleArr(descriptors)} ${sampleArr(places)}`,
                description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis, consectetur eos numquam harum facere laboriosam facilis hic iusto quisquam. Maxime vitae quis recusandae non excepturi, perferendis aperiam odio. Deleniti, mollitia?",
                price,
                image: [
                    {
                        url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                        filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                    },
                    {
                        url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                        filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                    }
                ],
                geometry: { type: 'Point', coordinates: [cities[rand1000].longitude, cities[rand1000].latitude] },
            }
        )
        await camp.save();
    }
}

func();