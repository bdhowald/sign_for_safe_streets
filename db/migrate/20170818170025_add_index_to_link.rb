class AddIndexToLink < ActiveRecord::Migration[5.1]
  def change
    add_index :campaigns, :link, unique: true
  end
end
