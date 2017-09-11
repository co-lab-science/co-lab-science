$(document).ready(function() {
    try {
        var contentId = $('#content-meta-info').data().contentId;
        var userid = $('#content-meta-info').data().userid;
        var contentType = $('#content-meta-info').data().contentType;
    } catch(e) {

    }

    function initObservations() {
        $('#observation-container-jq').comments({
            textareaRows: 2,
            maxRepliesVisible: 2,
            profilePictureURL: 'https://app.viima.com/static/media/user_profiles/user-icon.png',
            fieldMappings: {
                created: 'created_at',
                content: 'title'
            },
            noCommentsText: "No Observations",
            textareaPlaceholderText: "Add an observation",
            getComments: function(success, error) {
                var commentData = {}
                var observationId = contentId;
                if (contentType != "Lab") {
                    var searchKey = contentType.toLowerCase() + "_id"
                    commentData["lab"] = {};
                    commentData.lab[searchKey] = contentId
                    observationId = 0;
                }
                $.ajax({
                    url: '/observations/' + observationId + '.json',
                    type: "get",
                    data: commentData,
                    success: function(data) {
                        var sanitizedCommentsArray = JqueryCommentHelper.sanitizeParentId(data.related_observations, contentId)
                        success(sanitizedCommentsArray);
                        renderDownvotes()
                        sanitizedCommentsArray.forEach(function(comment) {
                            $('.comment*[data-id="' + comment.id + '"]').find('.downvote-count').html(comment.downvote_count)
                            $('.comment*[data-id="' + comment.id + '"]').data("user_has_downvoted", comment.user_has_downvoted)
                            if (comment.user_has_downvoted) {
                                $('.comment*[data-id="' + comment.id + '"]').find('.downvote').eq(0).addClass('highlight-font')
                            }
                        })
                        $('.comment-wrapper').find('.content').on('click', function(e) {
                            var id = $(this).closest('.comment').data().id
                            window.location = '/observations/' + id
                        })
                        if (!userid) {
                            $('.actions').remove()
                            $('.commenting-field').remove()
                        }
                    }
                })
            },
            postComment: function(commentJSON, success, error) {
                var commentData = { lab: { title: commentJSON.title, parent: (commentJSON.parent || contentId), user_id: userid } }
                if (contentType != "Lab") {
                    var searchKey = contentType.toLowerCase() + "_id"
                    commentData.lab[searchKey] = contentId
                    commentData.lab["create_from"] = contentType
                    commentData.lab["create_from_id"] = contentId
                    if (!commentJSON.parent) {
                        commentData.lab.parent =  undefined;
                    }
                }

                $.ajax({
                    type: 'post',
                    url: '/observations.json',
                    data: commentData,
                    success: function(comment) {
                        if (comment.observation.parent == contentId) {
                            delete comment.observation["parent"]
                        }
                        success(comment.observation)

                        handleNewComment(comment.observation.id)
                        handleNewComment(commentJSON.parent)
                        $('.comment-wrapper').find('.content').on('click', function(e) {
                            var id = $(this).closest('.comment').data().id
                            window.location = '/observations/' + id
                        })
                        if (!userid) {
                            $('.actions').remove()
                        }
                    },
                    error: error
                });
            },
            upvoteComment: function(commentJSON, success, error) {
                var upvotesURL = '/votes'
                if(commentJSON.user_has_upvoted) {
                    $.ajax({
                        type: 'post',
                        url: upvotesURL,
                        data: { vote_type: "upvote", lab_id: commentJSON.id, user_id: userid },
                        success: function() {
                            success(commentJSON)
                        },
                        error: error
                    });
                } else {
                    $.ajax({
                        type: 'delete',
                        url: upvotesURL + "/0",
                        data: { user_id: userid, vote_type: "upvote", lab_id: commentJSON.id},
                        success: function() {
                            success(commentJSON)
                        },
                        error: error
                    });
                }
            }
        });

        function renderDownvotes() {
            var markup = '<button class="action downvote"><span class="downvote-count">0</span><i class="fa fa-thumbs-down"></i></button>';
            $('.actions').append(markup)
            attachDownvoteEvents()
        }

        function handleNewComment(commentId) {
            var newCommentNode = $('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).append('<button class="action downvote"><span class="downvote-count">0</span><i class="fa fa-thumbs-down"></i></button>')
            attachDownvoteEvents($('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).find('.downvote'))
        }

        function attachDownvoteEvents(node) {
            $clickNode = node || $('.actions .downvote')
            $clickNode.on('click', function() {
                var upvotesURL = '/votes'
                var commentId = $(this).closest('.comment').data().id
                var userHasDownvoted = $(this).closest('.comment').data().user_has_downvoted

                if(!userHasDownvoted) {
                    $.ajax({
                        type: 'post',
                        url: upvotesURL,
                        data: { vote_type: "downvote", lab_id: commentId, user_id: userid },
                        success: function() {
                        },
                    });
                } else {
                    $.ajax({
                        type: 'delete',
                        url: upvotesURL + "/0",
                        data: { user_id: userid, vote_type: "downvote", lab_id: commentId},
                        success: function() {
                        },
                    });
                }

                if ($(this).hasClass('highlight-font')) {
                    $(this).removeClass('highlight-font')
                    var downvoteCount = parseInt($(this).find('.downvote-count').html()) - 1
                    $(this).find('.downvote-count').html(downvoteCount)

                } else {
                    $(this).addClass('highlight-font')
                    var downvoteCount = parseInt($(this).find('.downvote-count').html()) + 1
                    $(this).find('.downvote-count').html(downvoteCount)
                }
            })
        }

        JqueryCommentHelper = {
            sanitizeParentId: function(commentsArray, contentId) {
                var commentsArrayCopy = JSON.parse(JSON.stringify(commentsArray))
                return commentsArrayCopy.map(function(comment) { if (comment.parent == contentId) delete comment["parent"]; return comment })
            }
        }
    }

    function initQuestions() {
        $('#questions-container-jq').comments({
            textareaRows: 2,
            maxRepliesVisible: 2,
            profilePictureURL: 'https://app.viima.com/static/media/user_profiles/user-icon.png',
            textareaPlaceholderText: "Add a question",
            noCommentsText: "No Questions",
            fieldMappings: {
                created: 'created_at',
                content: 'title'
            },
            getComments: function(success, error) {
                var commentData = {}
                var questionId = contentId;
                if (contentType != "Question") {
                    var searchKey = contentType.toLowerCase() + "_id"
                    commentData["question"] = {};
                    commentData.question[searchKey] = contentId
                    questionId = 0;
                }
                $.ajax({
                    url: '/questions/' + questionId + '.json',
                    type: "get",
                    data: commentData,
                    success: function(data) {
                        var sanitizedCommentsArray = JqueryCommentHelper.sanitizeParentId(data.related_questions, questionId)
                        success(sanitizedCommentsArray);
                        renderDownvotes()
                        sanitizedCommentsArray.forEach(function(comment) {
                            $('.comment*[data-id="' + comment.id + '"]').find('.downvote-count').html(comment.downvote_count)
                            $('.comment*[data-id="' + comment.id + '"]').data("user_has_downvoted", comment.user_has_downvoted)
                            if (comment.user_has_downvoted) {
                                $('.comment*[data-id="' + comment.id + '"]').find('.downvote').eq(0).addClass('highlight-font')
                            }
                        })
                        $('.comment-wrapper').find('.content').on('click', function(e) {
                            var id = $(this).closest('.comment').data().id
                            window.location = '/questions/' + id
                        })
                        if (!userid) {
                            $('.actions').remove()
                            $('.commenting-field').remove()
                        }
                    }
                })
            },
            postComment: function(commentJSON, success, error) {
                var commentData = { question: { title: commentJSON.title, parent: (commentJSON.parent || contentId), user_id: userid } }
                if (contentType != "Question") {
                    var searchKey = contentType.toLowerCase() + "_id"
                    commentData.question[searchKey] = contentId
                    commentData.question["create_from"] = contentType
                    commentData.question["create_from_id"] = contentId
                    if (!commentJSON.parent) {
                        commentData.question.parent =  undefined;
                    }
                }

                $.ajax({
                    type: 'post',
                    url: '/questions.json',
                    data: commentData,
                    success: function(comment) {
                        if (comment.question.parent == contentId) {
                            delete comment.question["parent"]
                        }
                        success(comment.question)

                        handleNewComment(comment.question.id)
                        handleNewComment(commentJSON.parent)
                        $('.comment-wrapper').find('.content').on('click', function(e) {
                            var id = $(this).closest('.comment').data().id
                            window.location = '/questions/' + id
                        })
                        if (!userid) {
                            $('.actions').remove()
                        }
                    },
                    error: error
                });
            },
            upvoteComment: function(commentJSON, success, error) {
                var upvotesURL = '/votes'
                if(commentJSON.user_has_upvoted) {
                    $.ajax({
                        type: 'post',
                        url: upvotesURL,
                        data: { vote_type: "upvote", question_id: commentJSON.id, user_id: userid },
                        success: function() {
                            success(commentJSON)
                        },
                        error: error
                    });
                } else {
                    $.ajax({
                        type: 'delete',
                        url: upvotesURL + "/0",
                        data: { user_id: userid, vote_type: "upvote", question_id: commentJSON.id},
                        success: function() {
                            success(commentJSON)
                        },
                        error: error
                    });
                }
            }
        });

        function renderDownvotes() {
            var markup = '<button class="action downvote"><span class="downvote-count">0</span><i class="fa fa-thumbs-down"></i></button>';
            $('.actions').append(markup)
            attachDownvoteEvents()
        }

        function handleNewComment(commentId) {
            var newCommentNode = $('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).append('<button class="action downvote"><span class="downvote-count">0</span><i class="fa fa-thumbs-down"></i></button>')
            attachDownvoteEvents($('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).find('.downvote'))
        }

        function attachDownvoteEvents(node) {
            $clickNode = node || $('.actions .downvote')
            $clickNode.on('click', function() {
                var upvotesURL = '/votes'
                var commentId = $(this).closest('.comment').data().id
                var userHasDownvoted = $(this).closest('.comment').data().user_has_downvoted

                if(!userHasDownvoted) {
                    $.ajax({
                        type: 'post',
                        url: upvotesURL,
                        data: { vote_type: "downvote", question_id: commentId, user_id: userid },
                        success: function() {
                        },
                    });
                } else {
                    $.ajax({
                        type: 'delete',
                        url: upvotesURL + "/0",
                        data: { user_id: userid, vote_type: "downvote", question_id: commentId},
                        success: function() {
                        },
                    });
                }

                if ($(this).hasClass('highlight-font')) {
                    $(this).removeClass('highlight-font')
                    var downvoteCount = parseInt($(this).find('.downvote-count').html()) - 1
                    $(this).find('.downvote-count').html(downvoteCount)

                } else {
                    $(this).addClass('highlight-font')
                    var downvoteCount = parseInt($(this).find('.downvote-count').html()) + 1
                    $(this).find('.downvote-count').html(downvoteCount)
                }
            })
        }

        JqueryCommentHelper = {
            sanitizeParentId: function(commentsArray, contentId) {
                var commentsArrayCopy = JSON.parse(JSON.stringify(commentsArray))
                return commentsArrayCopy.map(function(comment) { if (comment.parent == contentId) delete comment["parent"]; return comment })
            }
        }
    }

    function initHypothesis() {
        $('#hypothesis-container-jq').comments({
            textareaRows: 2,
            maxRepliesVisible: 2,
            profilePictureURL: 'https://app.viima.com/static/media/user_profiles/user-icon.png',
            fieldMappings: {
                created: 'created_at',
                content: 'title'
            },
            textareaPlaceholderText: "Add a hypothesis",
            noCommentsText: "No Hypothesis",
            getComments: function(success, error) {
                var commentData = {}
                var hypothesisId = contentId;
                if (contentType != "Hypothesis") {
                    var searchKey = contentType.toLowerCase() + "_id"
                    commentData["hypothesis"] = {};
                    commentData.hypothesis[searchKey] = contentId
                    hypothesisId = 0;
                }
                $.ajax({
                    url: '/hypotheses/' + hypothesisId + '.json',
                    type: "get",
                    data: commentData,
                    success: function(data) {
                        var sanitizedCommentsArray = JqueryCommentHelper.sanitizeParentId(data.related_hypotheses, hypothesisId)
                        success(sanitizedCommentsArray);
                        renderDownvotes()
                        renderlikes()
                        console.log(sanitizedCommentsArray)
                        sanitizedCommentsArray.forEach(function(comment) {
                            if (comment.upvote_count > 1) {
                            }
                            $('.comment*[data-id="' + comment.id + '"]').find('.downvote-count').html(comment.downvote_count)
                            $('.comment*[data-id="' + comment.id + '"]').data("user_has_downvoted", comment.user_has_downvoted)
                            if (comment.user_has_downvoted) {
                                $('.comment*[data-id="' + comment.id + '"]').find('.downvote').eq(0).addClass('highlight-font')
                            }

                            $('.comment*[data-id="' + comment.id + '"]').find('.like-count').html(comment.like_count)
                            $('.comment*[data-id="' + comment.id + '"]').find('.dislike-count').html(comment.dislike_count)
                            $('.comment*[data-id="' + comment.id + '"]').data("user_has_liked", comment.user_has_liked)
                            $('.comment*[data-id="' + comment.id + '"]').data("user_has_disliked", comment.user_has_disliked)

                            if (comment.user_has_liked) {
                                $('.comment*[data-id="' + comment.id + '"]').find('.like').eq(0).addClass('highlight-font')
                            }
                            if (comment.user_has_disliked) {
                                $('.comment*[data-id="' + comment.id + '"]').find('.dislike').eq(0).addClass('highlight-font')
                            }

                        })
                        $('.comment-wrapper').find('.content').on('click', function(e) {
                            var id = $(this).closest('.comment').data().id
                            window.location = '/hypotheses/' + id
                        })
                        if (!userid) {
                            $('.actions').remove()
                            $('.commenting-field').remove()
                        }
                    }
                })
            },
            postComment: function(commentJSON, success, error) {
                var commentData = { hypothesis: { title: commentJSON.title, parent: (commentJSON.parent || contentId), user_id: userid } }
                if (contentType != "Hypothesis") {
                    var searchKey = contentType.toLowerCase() + "_id"
                    commentData.hypothesis[searchKey] = contentId
                    commentData.hypothesis["create_from"] = contentType
                    commentData.hypothesis["create_from_id"] = contentId
                    if (!commentJSON.parent) {
                        commentData.hypothesis.parent =  undefined;
                    }
                    if (!userid) {
                        $('.actions').remove()
                    }
                }

                $.ajax({
                    type: 'post',
                    url: '/hypotheses.json',
                    data: commentData,
                    success: function(comment) {
                        if (comment.hypothesis.parent == contentId) {
                            delete comment.hypothesis["parent"]
                        }
                        success(comment.hypothesis)

                        handleNewComment(comment.hypothesis.id)
                        handleNewComment(commentJSON.parent)
                        $('.comment-wrapper').find('.content').on('click', function(e) {
                            var id = $(this).closest('.comment').data().id
                            window.location = '/hypotheses/' + id
                        })
                    },
                    error: error
                });
            },
            upvoteComment: function(commentJSON, success, error) {
                var upvotesURL = '/votes'
                if(commentJSON.user_has_upvoted) {
                    $.ajax({
                        type: 'post',
                        url: upvotesURL,
                        data: { vote_type: "upvote", hypothesis_id: commentJSON.id, user_id: userid },
                        success: function() {
                            success(commentJSON)
                        },
                        error: error
                    });
                } else {
                    $.ajax({
                        type: 'delete',
                        url: upvotesURL + "/0",
                        data: { user_id: userid, vote_type: "upvote", hypothesis_id: commentJSON.id},
                        success: function() {
                            success(commentJSON)
                        },
                        error: error
                    });
                }
            }
        });

        function renderDownvotes() {
            var markup = '<button class="action downvote"><span class="downvote-count">0</span><i class="fa fa-thumbs-down"></i></button>';
            $('.actions').append(markup)
            attachDownvoteEvents()
        }

        function renderlikes() {
            var markup = '<button class="action like"><span class="like-count">0</span><i class="fa fa-arrow-up"></i></button>';
            $('.actions').append(markup)
            var markup = '<button class="action dislike"><span class="dislike-count">0</span><i class="fa fa-arrow-down"></i></button>';
            $('.actions').append(markup)
            attachLikeEvents()
            attachDislikeEvents()
        }

        function attachLikeEvents(node) {
            $clickNode = node || $('.actions .like')
            $clickNode.on('click', function() {
                var likesUrl = '/likes'
                var commentId = $(this).closest('.comment').data().id
                var userHasLiked = $(this).closest('.comment').data().user_has_liked
                $(this).closest('.comment').data('user_has_review', false)

                $self = $(this);

                if(!userHasLiked) {
                    $('#myModal').modal('show')
                    if (!$(this).closest('.comment').data().user_has_review) {
                        $('body').on('click', '#hypothesis-submit', function() {
                            if ($('#review-submission-content').val().trim() != "" && $('#review-submission-title').val().trim() != "") {
                                $.ajax({
                                    type: 'post',
                                    url: likesUrl,
                                    data: { like_type: "like", hypothesis_id: commentId, user_id: userid },
                                    success: function(data) {
                                        var likeCount = parseInt($self.find('.like-count').html()) + data.count
                                        $self.find('.like-count').html(likeCount)
                                        $self.closest('.comment').data('user_has_liked', true)
                                    },
                                });
                                $.ajax({
                                    type: 'post',
                                    url: '/reviews',
                                    data: { review: { body: $('#review-submission-content').val(), title: $('#review-submission-title').val(), user_id: userid, hypothesis_id: commentId } },
                                    success: function(data) {
                                    }
                                });
                                $('body').off()
                                $('#myModal').modal('hide')
                                $('#review-submission-content').val("")
                                $('#review-submission-title').val("")
                                $self.closest('.comment').data('user_has_liked', true)
                                $self.addClass('highlight-font')
                            } else {
                                alert("Review content and title can't be empty")
                            }
                        })
                        $self.closest('.comment').data('user_has_review', true)
                    }
                } else {
                    $self = $(this);
                    $self.closest('.comment').data('user_has_review', false)
                    $.ajax({
                        type: 'delete',
                        url: likesUrl + "/0",
                        data: { user_id: userid, like_type: "like", hypothesis_id: commentId},
                        success: function(data) {
                            var likeCount = parseInt($self.find('.like-count').html()) - data.count
                            $self.find('.like-count').html(likeCount)
                            $self.closest('.comment').data('user_has_liked', false)
                        },
                    });
                }

                if ($(this).hasClass('highlight-font')) {
                    $(this).removeClass('highlight-font')
                } else {
                }
            })
        }

        function attachDislikeEvents(node) {
            $clickNode = node || $('.actions .dislike')
            $clickNode.on('click', function() {
                var likesUrl = '/likes'
                var commentId = $(this).closest('.comment').data().id
                var userHasLiked = $(this).closest('.comment').data().user_has_disliked
                $(this).closest('.comment').data('user_has_review', false)


                $self = $(this)
                if(!userHasLiked) {
                    $('#myModal').modal('show')
                    if (!$(this).closest('.comment').data().user_has_review) {
                        $('body').on('click', '#hypothesis-submit', function() {
                            if ($('#review-submission-content').val().trim() != "" && $('#review-submission-title').val().trim() != "") {
                                $.ajax({
                                    type: 'post',
                                    url: likesUrl,
                                    data: { like_type: "dislike", hypothesis_id: commentId, user_id: userid },
                                    success: function(data) {
                                        var dislikeCount = parseInt($self.find('.dislike-count').html()) + data.count
                                        $self.find('.dislike-count').html(dislikeCount)
                                        $self.closest('.comment').data('user_has_disliked', true)
                                    },
                                });
                                $.ajax({
                                    type: 'post',
                                    url: '/reviews',
                                    data: { review: { body: $('#review-submission-content').val(), title: $('#review-submission-title').val(), user_id: userid, hypothesis_id: commentId } },
                                    success: function(data) {
                                    }
                                });
                                $('body').off()
                                $('#myModal').modal('hide')
                                $('#review-submission-content').val("")
                                $('#review-submission-title').val("")
                                $self.closest('.comment').data('user_has_liked', true)
                                $self.addClass('highlight-font')
                            } else {
                                alert("Review content and title can't be empty")
                            }
                        })
                        $self.closest('.comment').data('user_has_review', true)
                    }

                    } else {
                        $.ajax({
                            type: 'delete',
                            url: likesUrl + "/0",
                            data: { user_id: userid, like_type: "dislike", hypothesis_id: commentId},
                            success: function(data) {
                                var dislikeCount = parseInt($self.find('.dislike-count').html()) - data.count
                                $self.find('.dislike-count').html(dislikeCount)
                                $self.closest('.comment').data('user_has_disliked', false)
                            },
                        });
                    }

                    if ($(this).hasClass('highlight-font')) {
                        $(this).removeClass('highlight-font')
                    } 
                })
            }

            function handleNewComment(commentId) {
                var newCommentNode = $('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).append('<button class="action downvote"><span class="downvote-count">0</span><i class="fa fa-thumbs-down"></i></button>');
                attachDownvoteEvents($('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).find('.downvote'))
                var newCommentNode = $('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).append('<button class="action like" data-toggle="modal" data-target="#myModal"><span class="like-count">0</span><i class="fa fa-arrow-up"></i></button>');
                attachLikeEvents($('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).find('.like'))
                var newCommentNode = $('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).append('<button class="action dislike" data-toggle="modal" data-target="#myModal"><span class="dislike-count">0</span><i class="fa fa-arrow-down"></i></button>');
                attachDislikeEvents($('.comment*[data-id="' + commentId + '"]').find('.actions').eq(0).find('.dislike'))
            }

            function attachDownvoteEvents(node) {
                $clickNode = node || $('.actions .downvote')
                $clickNode.on('click', function() {
                    var upvotesURL = '/votes'
                    var commentId = $(this).closest('.comment').data().id
                    var userHasDownvoted = $(this).closest('.comment').data().user_has_downvoted

                    if(!userHasDownvoted) {
                        $.ajax({
                            type: 'post',
                            url: upvotesURL,
                            data: { vote_type: "downvote", hypothesis_id: commentId, user_id: userid },
                            success: function(data) {
                            },
                        });
                    } else {
                        $.ajax({
                            type: 'delete',
                            url: upvotesURL + "/0",
                            data: { user_id: userid, vote_type: "downvote", hypothesis_id: commentId},
                            success: function(data) {
                            },
                        });
                    }

                    if ($(this).hasClass('highlight-font')) {
                        $(this).removeClass('highlight-font')
                        var downvoteCount = parseInt($(this).find('.downvote-count').html()) - 1
                        $(this).find('.downvote-count').html(downvoteCount)

                    } else {
                        $(this).addClass('highlight-font')
                        var downvoteCount = parseInt($(this).find('.downvote-count').html()) + 1
                        $(this).find('.downvote-count').html(downvoteCount)
                    }
                })
            }

            JqueryCommentHelper = {
                sanitizeParentId: function(commentsArray, contentId) {
                    var commentsArrayCopy = JSON.parse(JSON.stringify(commentsArray))
                    return commentsArrayCopy.map(function(comment) { if (comment.parent == contentId) delete comment["parent"]; return comment })
                }
            }
        }
        $('.comment-type.type-observation').on('click', function () {
            $('.comments-container-jq').hide()
            $('.comment-type').removeClass('selected')
            $(this).addClass('selected')
            initObservations()
            $("#observation-container-jq").show()
        })

        $('.comment-type.type-citation').on('click', function () {
            $('.comments-container-jq').hide()
            $('.comment-type').removeClass('selected')
            $(this).addClass('selected')
            $("#citations-container-jq").show()
        })

        $('.comment-type.type-question').on('click', function () {
            $('.comments-container-jq').hide()
            $('.comment-type').removeClass('selected')
            $(this).addClass('selected')
            initQuestions()
            $("#questions-container-jq").show()
        })
        $('.comment-type.type-question').on('click', function () {
            $('.comments-container-jq').hide()
            $('.comment-type').removeClass('selected')
            $(this).addClass('selected')
            initQuestions()
            $("#questions-container-jq").show()
        })
        $('.comment-type.type-hypothesis').on('click', function () {
            $('.comments-container-jq').hide()
            $('.comment-type').removeClass('selected')
            $(this).addClass('selected')
            initHypothesis()
            $("#hypothesis-container-jq").show()
        })
        $('.comment-type.type-review').on('click', function () {
            $('.comments-container-jq').hide()
            $('.comment-type').removeClass('selected')
            $(this).addClass('selected')
          $('#reviews-container-jq').show()
        })
    })



