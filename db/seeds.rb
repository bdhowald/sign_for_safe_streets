# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

["pedestrian", "cyclist", "crosswalk", "student", "school", "walking", "biking", "bicycle", "bike", "ride", "complete street", "protected bike lane", "transit", "subway", "train", "bus", "greenway", "bridge", "pathway", "cycling", "child safety", "bronx", "brooklyn", "manhattan", "queens", "staten island", "bike lane", "citywide", "statewide"].each{|word| Tag.create(word: word)}
