class CampaignKeywordsFilter

  require 'lingua/stemmer'

  def initialize(campaigns = [])
    if campaigns.empty?
      campaigns = Campaign.all
    end

    @campaigns = Set.new(campaigns)
    @stemmer   = Lingua::Stemmer.new(:language => "en")
  end

  def filter_campaigns

    @campaigns.each do |campaign|

      puts "Filtering campaign :#{campaign.name}"

      old_tags = campaign.tags
      new_tags = []


      Tag.all.each do |tag|

        exact_word = @stemmer.stem(tag.word) == tag.word

        # grab word if it matches stem
        if (campaign.description =~ / #{@stemmer.stem(tag.word)}#{exact_word ? ' ' : ''}/i)
          new_tags << tag
        end

        # grab word if it matches exactly
        if (campaign.description =~ / #{tag.word}([[:punct:]]| )/i)
          if !new_tags.include?(tag)
            new_tags << tag
          end
        end

        # grab word if it matches plural
        if (campaign.description =~ / #{tag.word.pluralize}([[:punct:]]| )/i)
          if !new_tags.include?(tag)
            new_tags << tag
          end
        end
      end


      # special case for borough tags
      # people may use borough name's in descriptions
      # but the use may be comparative or illustrative
      # without implying connection to that borough.
      boro_tags = [
        'bronx',
        'brooklyn',
        'manhattan',
        'queens',
        'staten island',
        'citywide',
        'statewide'
      ].collect{|boro| Tag.find_by(word: boro)}

      boro_tags.each{|tag|
        if campaign.borough.downcase == tag.word
          if !new_tags.include?(tag)
            new_tags += [tag]
          end
        else
          # if new_tags.include?(tag)
          #   new_tags -= [tag]
          # end
        end
      }


      # tags to be removed
      (old_tags - new_tags).each{|old_tag| campaign.tags.delete(old_tag)}

      # tags to be added
      (new_tags - old_tags).each{|new_tag| campaign.tags << new_tag}

    end

    puts "\nFiltered #{@campaigns.count} campaigns"
  end

  def add(campaigns)
    @campaigns += Array.wrap(campaigns)
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