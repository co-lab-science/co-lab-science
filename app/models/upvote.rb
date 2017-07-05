class Upvote < ApplicationRecord
  belongs_to :user
  belongs_to :comment, required: false
  belongs_to :hypothesis, required: false
  belongs_to :questions, required: false
end