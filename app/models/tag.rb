class Tag < ApplicationRecord
  has_and_belongs_to_many :campaigns
  has_and_belongs_to_many :categories

  validates_presence_of :word
end
