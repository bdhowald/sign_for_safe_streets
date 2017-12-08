class AddIntegerIndexesToUsers < ActiveRecord::Migration[5.1]
  def change
    add_index :users, :fingerprint_id
    add_index :users, :mixpanel_id
  end
end
