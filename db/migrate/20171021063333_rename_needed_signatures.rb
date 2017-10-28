class RenameNeededSignatures < ActiveRecord::Migration[5.1]
  def change
    rename_column :campaigns, :needed_signatures, :signatures_needed
  end
end
