class Question < ApplicationRecord
  belongs_to :lab
  belongs_to :user
  has_many :comments
  has_many :likes
  has_many :dislikes
end
