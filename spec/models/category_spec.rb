# spec/models/campaign_spec.rb
require 'rails_helper'

RSpec.describe Category, type: :model do

  context 'associations' do

    # Association tests
    # ensure Category has a has-and-belongs-to-many
    # relationship with tags
    it { should have_and_belong_to_many(:tags) }

  end


  context "validations" do

    it { should validate_presence_of :name }

  end

end