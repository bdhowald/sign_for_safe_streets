module ApplicationHelper
  def address_string(address_obj)
    if address_obj
      return "#{address_obj['street']}, #{address_obj['city']}, #{address_obj['state']} #{address_obj['zip']}, USA"
    end
  end
end
