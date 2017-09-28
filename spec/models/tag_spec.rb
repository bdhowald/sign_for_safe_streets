# spec/models/campaign_spec.rb
require 'rails_helper'

RSpec.describe Tag, type: :model do

  context 'associations' do

    # Association tests
    # ensure Tag has a has-and-belongs-to-many
    # relationship with campaigns
    it { should have_and_belong_to_many(:campaigns) }

    # ensure Tag has a one-to-many relationship
    # with categories
    it { should have_and_belong_to_many(:categories) }

  end


  context "validations" do

    it { should validate_presence_of :word }

  end

end