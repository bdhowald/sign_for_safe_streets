require "administrate/base_dashboard"

class CampaignDashboard < Administrate::BaseDashboard
  # ATTRIBUTE_TYPES
  # a hash that describes the type of each of the model's fields.
  #
  # Each different type represents an Administrate::Field object,
  # which determines how the attribute is displayed
  # on pages throughout the dashboard.
  ATTRIBUTE_TYPES = {
    tags: Field::HasMany,
    users: Field::HasMany,
    categories: Field::HasMany,
    id: Field::Number,
    name: Field::String,
    link: Field::String,
    borough: Field::String,
    starter: Field::String,
    created_at: Field::DateTime,
    updated_at: Field::DateTime,
    description: Field::Text,
    num_signatures: Field::Number,
    is_active: Field::Boolean,
    signatures_needed: Field::Number,
    is_success: Field::Boolean,
    targets: Field::Text,
    letter: Field::Text,
    alert_id: Field::Number,
    node_id: Field::Number,
    offline_id: Field::Number,
    offline_num: Field::Number,
  }.freeze

  # COLLECTION_ATTRIBUTES
  # an array of attributes that will be displayed on the model's index page.
  #
  # By default, it's limited to four items to reduce clutter on index pages.
  # Feel free to add, remove, or rearrange items.
  COLLECTION_ATTRIBUTES = [
    :id,
    :name,
    :tags,
    :users,
    :categories,
  ].freeze

  # SHOW_PAGE_ATTRIBUTES
  # an array of attributes that will be displayed on the model's show page.
  SHOW_PAGE_ATTRIBUTES = [
    :tags,
    :users,
    :categories,
    :id,
    :name,
    :link,
    :borough,
    :starter,
    :created_at,
    :updated_at,
    :description,
    :num_signatures,
    :is_active,
    :signatures_needed,
    :is_success,
    :targets,
    :letter,
    :alert_id,
    :node_id,
    :offline_id,
    :offline_num,
  ].freeze

  # FORM_ATTRIBUTES
  # an array of attributes that will be displayed
  # on the model's form (`new` and `edit`) pages.
  FORM_ATTRIBUTES = [
    :tags,
    :users,
    :categories,
    :name,
    :link,
    :borough,
    :starter,
    :description,
    :num_signatures,
    :is_active,
    :signatures_needed,
    :is_success,
    :targets,
    :letter,
    :alert_id,
    :node_id,
    :offline_id,
    :offline_num,
  ].freeze

  # Overwrite this method to customize how campaigns are displayed
  # across all pages of the admin dashboard.
  #
  def display_resource(campaign)
    "##{campaign.id} - #{campaign.name}"
  end
end
