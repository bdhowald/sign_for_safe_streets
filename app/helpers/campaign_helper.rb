module CampaignHelper
  def string_with_ellipses(description, length = 100)
    if description.length <= length
      description
    else
      truncated_text = description[0..length-1]
      if truncated_text.end_with?(' ')
        truncated_text + '...'
      else
        truncated_text + ' ...'
      end
    end
  end
end