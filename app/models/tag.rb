class Tag < ApplicationRecord

  include PgSearch

  pg_search_scope :search_full_text,
    against: :word,
    using: {
      tsearch: {
        any_word: true,
        dictionary: "english",
        normalization: 1,
        prefix: true
      }
    }


  has_and_belongs_to_many :campaigns
  has_and_belongs_to_many :categories

  validates_presence_of :word
end
