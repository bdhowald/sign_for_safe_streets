class Campaign < ApplicationRecord

  include PgSearch

  pg_search_scope :search_full_text,
    against: {
      name:    'A',
      borough: 'B',
      letter:  'C',
      link:    'C',
      starter: 'D',
      targets: 'D'
    },
    using: {
      tsearch: {
        dictionary: "english",
        normalization: 1,
        prefix: true
      }
    }


  has_and_belongs_to_many :tags
  has_many :categories, through: :tags

  scope :active, -> { where(is_active: true) }

  validates_presence_of :borough, :description, :link,
    :name, :num_signatures
  validates_numericality_of :num_signatures

  LINK_BASE_URL = "https://campaigns.transalt.org"


  def description_first_paragraph
    (description || " ").split(/<p>|<\/p>/).reject(&:blank?).first.strip
  end

  def full_url
    LINK_BASE_URL + link
  end

  def shortened_description(n)
    (description || "")[0..n-1]
  end

  def shortened_name(n)
    (name || "")[0..n-1]
  end

end
