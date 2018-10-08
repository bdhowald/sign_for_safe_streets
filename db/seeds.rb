# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

[
  "pedestrian",
  "cyclist",
  "crosswalk",
  "student",
  "school",
  "walking",
  "biking",
  "bicycle",
  "bike",
  "ride",
  "complete street",
  "protected bike lane",
  "transit",
  "subway",
  "train",
  "bus",
  "greenway",
  "bridge",
  "pathway",
  "cycling",
  "child safety",
  "bronx",
  "brooklyn",
  "manhattan",
  "queens",
  "staten island",
  "bike lane",
  "citywide",
  "statewide"
].each{|word|
  Tag.find_or_create_by(word: word)
}

[
  "Eastern Queens",
  "Western Queens",
  "Brooklyn",
  "North Brooklyn",
  "Southwest Brooklyn",
  "Staten Island",
  "The Bronx",
  "Manhattan",
  "Upper Manhattan"
].each{|region_name|
  Region.find_or_create_by(name: region_name)
}

[
  'cycling',
  'walking',
  'transit',
  'schools'
].each{|word|
  Category.find_or_create_by(name: word)
}

cycling = Category.find_by(name: 'cycling')
[
  "cyclist",
  "biking",
  "bike",
  "ride",
  "complete street",
  "protected bike lane",
  "greenway",
  "bridge",
  "pathway",
  "cycling",
  "bike lane",
].each{|word|
  tag = Tag.find_by(word: word)
  if !cycling.tags.include?(tag)
    cycling.tags << tag
  end
}

walking = Category.find_by(name: 'walking')
[
  "pedestrian",
  "crosswalk",
  "walking",
  "complete street",
  "greenway",
  "bridge",
  "pathway"
].each{|word|
  tag = Tag.find_by(word: word)
  if !walking.tags.include?(tag)
    walking.tags << tag
  end
}

transit = Category.find_by(name: 'transit')
[
  "transit",
  "subway",
  "train",
  "bus"
].each{|word|
  tag = Tag.find_by(word: word)
  if !transit.tags.include?(tag)
    transit.tags << tag
  end
}

schools = Category.find_by(name: 'schools')
[
  "student",
  "school",
  "child safety"
].each{|word|
  tag = Tag.find_by(word: word)
  if !schools.tags.include?(tag)
    schools.tags << tag
  end
}







