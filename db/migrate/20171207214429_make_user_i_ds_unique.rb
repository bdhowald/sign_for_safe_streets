class MakeUserIDsUnique < ActiveRecord::Migration[5.1]
  def change
    remove_index :users, :fingerprint_id
    remove_index :users, :mixpanel_id

    add_index :users, :fingerprint_id, unique: true
    add_index :users, :mixpanel_id, unique: true
  end
end
