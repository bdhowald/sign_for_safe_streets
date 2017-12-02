# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20171028073322) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "campaigns", force: :cascade do |t|
    t.string "name", null: false
    t.string "link", null: false
    t.string "borough", null: false
    t.string "starter", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
    t.integer "num_signatures", default: 0, null: false
    t.boolean "is_active", default: true, null: false
    t.integer "signatures_needed", default: 0
    t.boolean "is_success", default: false
    t.text "targets", default: ""
    t.text "letter", default: ""
    t.integer "alert_id"
    t.integer "node_id"
    t.integer "offline_id"
    t.integer "offline_num"
    t.index ["link"], name: "index_campaigns_on_link", unique: true
  end

  create_table "campaigns_tags", id: false, force: :cascade do |t|
    t.integer "campaign_id"
    t.integer "tag_id"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "categories_tags", id: false, force: :cascade do |t|
    t.integer "category_id"
    t.integer "tag_id"
  end

  create_table "tags", force: :cascade do |t|
    t.string "word", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
