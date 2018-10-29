module.exports = function(optimist) {
	optimist
		.boolean("help").alias("help", "h").alias("help", "?").describe("help")
		.string("init").describe("init  init a project template with specfic name")
		.string("config").alias("config", "c").describe("config sfpack.config.js")
		.string("entry").describe("entry")
		.string("entryDir").describe("entryDir entry‘s parent dirctory")
		.string("dist").describe("dist")
		.string("publicPath").alias("publicPath", "p").describe("publicPath")
		.boolean("compress").describe("compress  false")
		.boolean("hash").describe("hash  false")
};
