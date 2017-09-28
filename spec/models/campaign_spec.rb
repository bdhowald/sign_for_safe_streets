# spec/models/campaign_spec.rb
require 'rails_helper'

RSpec.describe Campaign, type: :model do

  context 'associations' do

    # Association tests
    # ensure Campaign has a has-and-belongs-to-many
    # relationship with tags
    it { should have_and_belong_to_many(:tags) }

    # ensure Campaign has a one-to-many relationship
    # with categories
    it { should have_many(:categories) }

  end


  context "methods" do

    cp = Campaign.new

    context "#description_first_paragraph" do

      it "should return the first paragraph of
        the description" do

        test_description = "<p>First paragraph.</p><p>Second paragraph.</p>"

        cp.stub(description: test_description)

        cp.description_first_paragraph.should eql(
          "First paragraph."
        )

      end

    end


    context "#full_url" do

      it "should provide a link to the campaign's url
        on the Transportation Alternatives site" do

        random_string =
          (0...50).map { ('a'..'z').to_a[rand(26)] }.join

        cp.stub(link: random_string)

        cp.full_url.should eql (Campaign::LINK_BASE_URL + random_string)

      end

    end


    context "#shortened_description" do

      it "should shorten the description to the desired amount" do

        test_description = "This is a test_description."

        cp.stub(description: test_description)

        n = Kernel.rand(test_description.length)

        cp.shortened_description(n).should eql test_description[0..n-1]

      end

    end


    context "#shortened_name" do

      it "should shorten the name of the campaign to the desired amount" do

        test_name = "This is a test_name."

        cp.stub(name: test_name)

        n = Kernel.rand(test_name.length)

        cp.shortened_name(n).should eql test_name[0..n-1]

      end

    end

  end


  context "validations" do

    it { should validate_presence_of :borough }
    it { should validate_presence_of :description }
    it { should validate_presence_of :link }
    it { should validate_presence_of :name }
    it { should validate_presence_of :num_signatures }
    it { should validate_numericality_of :num_signatures }

  end

end