class CampaignKeywordsFilter

  require 'lingua/stemmer'

  def initialize
    @campaigns = Set.new
    @stemmer   = Lingua::Stemmer.new(:language => "en")
  end

  def filter_campaigns
    @campaigns.each do |campaign|

      old_tags = campaign.tags
      new_tags = []


      Tag.all.each do |tag|

        # grab word if it matches stem
        if (campaign.description =~ / #{@stemmer.stem(tag.word)}/)
          new_tags << tag
        end

        # grab word if it matches exactly
        if (campaign.description =~ / #{tag.word}/)
          if !new_tags.include?(tag)
            new_tags << tag
          end
        end
      end


      # tags to be removed
      (old_tags - new_tags).each{|old_tag| campaign.tags.delete(old_tag)}

      # tags to be added
      (new_tags - old_tags).each{|new_tag| campaign.tags << new_tag}

    end
  end

  def add(campaign)
    @campaigns << campaign
  end

  # def keywords
  #   [
  #     "pedestrian", "cyclist", "crosswalk", "student",
  #     "school", "walking", "biking", "bicycle", "bike",
  #     "ride", "complete street", "protected bike lane",
  #     "transit", "subway", "train", "bus", "greenway",
  #     "bridge", "pathway"
  #   ]
  # end

end