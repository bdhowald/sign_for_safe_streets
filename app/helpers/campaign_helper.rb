module CampaignHelper


  def abbreviate_targets(targets)
    new_str = targets.dup

    if /(bronx|brooklyn|manhattan|queens)/i.match(new_str)
      new_str.gsub!($&, "#{borough_abbreviation($1)}.")
    end

    if /staten island/i.match(new_str)
      new_str.gsub!($&, 'S.I.')
    end

    new_str.gsub!(/(The )?New York City/, 'NYC')
    new_str.gsub!(/public advocate/i, 'Pub. Adv.')
    new_str.gsub!(/Commissioner/, 'Commr.')

    new_str.gsub!(/borough\s*president/i, 'BP')
    new_str.gsub!(/\bborough\b/i, 'Boro')

    new_str.gsub!(/community\s*board/i, 'CB')
    new_str.gsub!(/district\s*manager/i, 'DM')
    new_str.gsub!(/community\s*coordinator/i, 'Comm. Coord.')
    new_str.gsub!(/community\s*service/i, 'Comm. Serv.')

    new_str.gsub!(/(city )?council\s*(member|man|woman)/i, 'CM')


    new_str.gsub!(/assembly\s*(member|man|woman)/i, 'AM')
    new_str.gsub!(/\bassembly\b/i, 'Ass.')
    new_str.gsub!(/\bspeaker\b/i, 'Spkr.')

    new_str.gsub!(/\b(NY|New York) State\b/i, 'NYS')
    new_str.gsub!(/\bsen(ate|ator)?\b/i, 'Sen.')
    new_str.gsub!(/state\s*senator/i, 'Sen.')

    new_str.gsub!(/governor/i, 'Gov.')

    new_str.gsub!(/Transportation/, 'Transp.')
    new_str.gsub!(/Committee/, 'Comm.')

    new_str
  end


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
      else
        return borough
    end
  end


  def format_letter(letter)
    new_letter = letter.dup
    new_letter.gsub!(/\n/, '<br>')

    new_letter.html_safe
  end


  def remove_targets_abbreviations(targets)
    new_str = targets.dup
    new_str.gsub!(/\bbp\b/i, 'Borough President')
    new_str.gsub!(/\bcb\b/i, 'Community Board')
    new_str.gsub!(/\bcm\b/i, 'Council Member')
    new_str.gsub!(/\bam\b/i, 'Assembly Member')
    new_str.gsub!(/\b(ss|sen\.?)\b/i, 'State Senator')
    new_str.gsub!(/\bspeaker\b/i, 'Assemby Speaker')

    new_str.gsub!(/\bNYC\b/i, 'New York City')
    new_str.gsub!(/\bDOT\b/i, 'Department of Transportation')
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