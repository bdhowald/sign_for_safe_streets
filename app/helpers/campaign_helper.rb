module CampaignHelper

  def borough_abbreviation(borough)
    case borough.downcase
      when "bronx"
        return "Bx"
      when "brooklyn"
        return "Bk"
      when "manhattan"
        return "Manh"
      when "queens"
        return "Qns"
      when "staten island"
        return "SI"
      when "citywide"
        return "NYC"
      when "statewide"
        return "NYS"
    end
  end


  def target_abbreviation(targets)
    new_str = targets
    new_str.gsub!(/borough\s*president/i, 'BP')
    new_str.gsub!(/community\s*board/i, 'CB')
    new_str.gsub!(/council\s*(member|man|woman)/i, 'CM')
    new_str.gsub!(/assembly\s*(member|man|woman)/i, 'AM')
    new_str.gsub!(/state\s*senator/i, 'SS')
    new_str
  end


  def string_with_ellipses(orig_str, length = 100)
    if orig_str.length <= length
      return orig_str
    else

      str = ''

      orig_str.split.collect{|token|
        if ([str, token].join(' ').length < length)
          str = [str, token].join(' ')
        end
      }

      str.end_with?(' ') ? str += '...' : str += ' ...'

      return str.strip
    end
  end
end