class Category < ApplicationRecord
  has_and_belongs_to_many :tags
  has_many :campaigns, through: :tags

  validates_presence_of :name
end
