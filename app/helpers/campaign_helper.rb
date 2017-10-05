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