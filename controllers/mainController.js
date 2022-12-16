const Like = require("./../models/likeModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cryptoList = require("./api/cryptoList");
const globalMetrics = require("./api/globalMetrics");
const trendingFour = require("./api/trendingFour");
const fearIndex = require("./api/fearIndex");
const coinInfo = require("./api/coinInfo");
const favourites = require("./api/favourites");
const supportedCoins = require("../utils/supportedCoins");
const Post = require("../models/postModel");
const User = require("../models/userModel");

// Get all needed info for dashboard
exports.getDashBoard = catchAsync(async (_, res, next) => {
	// Get Data
	await Promise.all([
		cryptoList.cryptoList(100, false),
		cryptoList.cryptoList(10, true),
		globalMetrics.globalMetrics(),
		trendingFour.topFour(),
		fearIndex.index(),
	])
		.then((response) => {
			res.status(200).json({
				status: "success",
				data: {
					coinsTop100List: response[0],
					coinsTop10List: response[1],
					global: {
						overview: response[2].overview,
						btcMC: response[2].btcMarketCap,
					},
					topFour: response[3],
					fearAndGreed: response[4],
				},
			});
		})
		.catch((_) => {
			return next(new AppError("Something Went Wrong With the C_API !", 500));
		});
});

// Get info on specifc coin
exports.getCoinInfo = catchAsync(async (req, res, next) => {
	// Check if the coins is available
	const coinIsAvailable = await supportedCoins.coinSupported(req.params.coinID.toLowerCase());

	if (!coinIsAvailable) return next(new AppError("Coin Not Found", 404));

	// Get Results
	const results = await coinInfo.getCoin(coinIsAvailable.symbol, coinIsAvailable.id);

	res.status(200).json({
		status: "success",
		data: {
			coinInfo: results,
		},
	});
});

// Get User's Favourite coins info
exports.getFavs = catchAsync(async (req, res, _) => {
	// Get Favourites Data
	const favArr = await favourites.finalIizeFavsList(req.body.favs);

	res.status(200).json({
		status: "success",
		data: {
			favArr,
		},
	});
});

// Get Top 7 Like Coins by users
exports.getTopFavs = catchAsync(async (_, res, _1) => {
	const likes = await Like.aggregate([
		{
			$group: { _id: "$coinSymbol", total: { $sum: 1 } },
		},
		{
			$sort: { total: -1 },
		},
		{
			$limit: 7,
		},
	]);

	let topFavs = [];

	likes.forEach((el) => {
		topFavs.push({ coin: el._id, total: el.total });
	});

	res.status(200).json({
		status: "success",
		data: {
			topFavs,
		},
	});
});

// Get Specific User Data
exports.getUserData = catchAsync(async (req, res, _) => {
	const likes = await Like.find({ user: req.params.userID }).select("-_id").select("-__v").select("-user");

	await Promise.all([
		User.findOne({ _id: req.params.userID }).select("-_id").select("-__v").select("-likes"),
		Post.find({ user: req.params.userID }),
		favourites.finalIizeFavsList(likes),
	])
		.then((response) => {
			res.status(200).json({
				status: "success",
				data: {
					user: response[0],
					posts: response[1],
					favs: response[2],
				},
			});
		})
		.catch((_) => {
			return next(new AppError("Something Went Wrong Fetching User Data!", 500));
		});
});
