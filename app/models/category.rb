class Category < ApplicationRecord

  include PgSearch

  pg_search_scope :search_full_text,
    against: :name,
    using: {
      tsearch: {
        dictionary: "english",
        normalization: 1,
        prefix: true
      }
    }

  has_and_belongs_to_many :tags
  has_many :campaigns, through: :tags

  validates_presence_of :name
end
