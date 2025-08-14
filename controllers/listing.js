const Listing = require("../models/listing.js");
const axios = require("axios");
const mapToken = process.env.MAP_TOKEN;

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } }) //nested
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// module.exports.createListing = async (req, res, next) => {
//   // let {title,description, image ,price, country, location} = req.body;
//   let response = await client.geocoding.search({
//     q: "IIT Bhubaneswar",
//     limit: 1,
//   });

//   console.log(response);
//   res.send("done!");

//   let url = req.file.path;
//   let filename = req.file.filename;

//   const newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id;
//   newListing.image = { url, filename };
//   await newListing.save();
//   req.flash("success", "new listing created");
//   res.redirect("/listings");
// };
module.exports.createListing = async (req, res, next) => {
  try {
    // 1. Geocode location with LocationIQ
    const geoRes = await axios.get("https://us1.locationiq.com/v1/search.php", {
      params: {
        key: mapToken,
        q: req.body.listing.location,
        format: "json",
        limit: 1,
      },
    });

    if (!geoRes.data || !geoRes.data[0]) {
      req.flash("error", "Invalid location. Please try again.");
      return res.redirect("/listings/new");
    }

    const { lat, lon } = geoRes.data[0];

    // 2. Uploaded image data
    let url = req.file?.path || "";
    let filename = req.file?.filename || "";

    // 3. Create listing with geo-coordinates
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = {
      type: "Point",
      coordinates: [parseFloat(lon), parseFloat(lat)],
    };

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error creating listing:", err.message);
    req.flash("error", "Unable to create listing. Please try again.");
    res.redirect("/listings");
  }
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_100,w_250");
  //   res.render("listings/edit.ejs", { listing, originalImageUrl });
  // }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  // res.redirect(`/listings/${id}`);
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = { url, filename };

    await listing.save();
  }

  req.flash("success", "listing updated");
  res.redirect(`/listings/${id}`);
};
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "listing deleted");
  res.redirect("/listings");
};
