module ApplicationHelper

  def address_complete?(address_obj)
    if address_obj.present?
      return (
        address_obj['street'].present? &&
        address_obj['city'].present?   &&
        address_obj['state'].present?  &&
        address_obj['zip'].present?
      )
    end

    return false
  end

  def address_string(address_obj)
    if address_obj.present?
      # return "#{address_obj['street']}, #{address_obj['city']}, #{address_obj['state']} #{address_obj['zip']}, USA"
      if address_obj['state'].present?
        if address_obj['city'].present?
          if address_obj['street'].present?
            "#{address_obj['street']}, #{address_obj['city']}, #{address_obj['state']}, #{address_obj['zip']}, USA"
          else
            "#{address_obj['city']}, #{address_obj['state']} #{address_obj['zip']}, USA"
          end
        else
          "#{address_obj['state']} #{address_obj['zip']}, USA"
        end
      end
    end
  end

  def assemble_results_string(search_term, location_filter_terms, category_filter_terms)

    results = {}

    if !(combined_terms = (Array.wrap(search_term) + Array.wrap(category_filter_terms))).empty?
      results[:match_string_parts] = combined_terms
    end

    if location_filter_terms

      if location_filter_terms.include?("Bronx")
        location_filter_terms.collect!{|elem|
          elem == 'Bronx' ? 'the Bronx' : elem
        }
      end

      if location_filter_terms.any?{|elem| elem =~ /wide/}
        location_filter_terms.collect!{|elem|
          elem =~ /wide/ ? elem.downcase : elem
        }
      end

      location_filter_terms.sort_by! { |term| ['citywide', 'statewide'].include?(term) ? 0 : -1 }


      results[:location_string] = if (location_filter_terms - ['citywide', 'statewide']).empty?
        location_filter_terms.to_sentence
      else
        "in #{location_filter_terms.to_sentence}"
      end
    end

    return results
  end

end
