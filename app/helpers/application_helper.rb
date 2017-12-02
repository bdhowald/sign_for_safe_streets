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

end
